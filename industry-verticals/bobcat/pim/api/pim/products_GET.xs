// GET /products: paged listing of a category (and its subcategories) with search, status, fitment and spec filters, plus facet counts.
// status: current (default) = active only, previous = discontinued only, all = both. Drafts are never listed.
// filters: JSON object {facet_key: value}, e.g. {"operating_weight": "7500"}.
// fits: a machine SKU; keeps only the attachments that fit it.
query products verb=GET {
  api_group = "pim"
  description = "Paged products of a category with facets."

  input {
    text? category? filters=trim|lower
    text? q? filters=trim
    text? status? filters=trim|lower
    text? kind? filters=trim|lower
    text? fits? filters=trim
    json? filters?
    int page?=1 filters=min:1
    int per_page?=24 filters=min:1|max:100
    bool facets?=true
  }

  stack {
    var $path {
      value = "/"
    }

    conditional {
      if ($input.category != null && $input.category != "") {
        db.get "categories" {
          field_name = "slug"
          field_value = $input.category
        } as $cat

        precondition ($cat != null) {
          error_type = "notfound"
          error = "Unknown category"
        }

        var.update $path {
          value = $cat.sitecore_path ~ "/"
        }
      }
    }

    db.query "products" {
      where = ($db.products.category_path includes $path) && $db.products.status != "draft" && $db.products.product_kind ==? $input.kind
      sort = {model: "asc"}
      return = {type: "list"}
    } as $all

    // Status counts are taken before any filter, so the "Previous models" toggle can show its count.
    var $status_counts {
      value = {
        current : ($all|filter:$$.status == "active")|count
        previous: ($all|filter:$$.status == "discontinued")|count
      }
    }

    var $status {
      value = $input.status ?? "current"
    }

    // Natural order of the model name (E10, E17, E26 ... E145), which is also size order.
    var $rows {
      value = $all|sort:"model":"inatural":true
    }

    conditional {
      if ($status == "current") {
        var.update $rows {
          value = $rows|filter:$$.status == "active"
        }
      }

      elseif ($status == "previous") {
        var.update $rows {
          value = $rows|filter:$$.status == "discontinued"
        }
      }
    }

    conditional {
      if ($input.q != null && $input.q != "") {
        var $needle {
          value = $input.q|to_lower
        }

        var.update $rows {
          value = $rows|filter:((($$.model ~ " " ~ $$.name ~ " " ~ $$.sku)|to_lower)|contains:$needle)
        }
      }
    }

    conditional {
      if ($input.fits != null && $input.fits != "") {
        db.query "fitment" {
          where = $db.fitment.machine_sku == $input.fits
          return = {type: "list"}
        } as $fit

        var $fitset {
          value = {}
        }

        foreach ($fit) {
          each as $f {
            var.update $fitset {
              value = $fitset|set:$f.attachment_sku:true
            }
          }
        }

        var.update $rows {
          value = $rows|filter:($fitset|has:$$.sku)
        }
      }
    }

    // Facet values of every product in scope: specmap[sku][facet_key] = value
    db.query "product_specs" {
      join = {
        products: {
          table: "products"
          type : "inner"
          where: $db.product_specs.sku == $db.products.sku
        }
      }

      where = $db.product_specs.facet_key != null && ($db.products.category_path includes $path) && $db.products.status != "draft"
      return = {type: "list"}
    } as $specs

    var $specmap {
      value = {}
    }

    var $m {
      value = {}
    }

    foreach ($specs) {
      each as $s {
        var.update $m {
          value = $specmap|get:$s.sku:{}
        }

        var.update $specmap {
          value = $specmap|set:$s.sku:($m|set:$s.facet_key:$s.value)
        }
      }
    }

    var $want {
      value = ""
    }

    conditional {
      if ($input.filters != null) {
        foreach ($input.filters|keys) {
          each as $k {
            var.update $want {
              value = ($input.filters|get:$k)|to_text
            }

            var.update $rows {
              value = $rows|filter:((($specmap|get:$$.sku:{})|get:$k:"") == $want)
            }
          }
        }
      }
    }

    // Facet counts over the filtered rows: [{key, values: [{value, count}]}].
    // A list, not an object keyed by value: values such as "24.8" would be read as a path.
    var $facet_counts {
      value = []
    }

    var $pairs {
      value = []
    }

    var $vals {
      value = []
    }

    var $counted {
      value = []
    }

    conditional {
      if ($input.facets) {
        foreach ($rows) {
          each as $p {
            var.update $m {
              value = $specmap|get:$p.sku:{}
            }

            foreach ($m|keys) {
              each as $key {
                var.update $pairs {
                  value = $pairs|push:{k: $key, v: $m|get:$key}
                }
              }
            }
          }
        }

        foreach (($pairs|map:$$.k)|unique) {
          each as $fk {
            var.update $vals {
              value = ($pairs|filter:$$.k == $fk)|map:$$.v
            }

            var.update $counted {
              value = []
            }

            foreach (($vals|unique)|sort:"":"inatural":true) {
              each as $u {
                var.update $counted {
                  value = $counted|push:{value: $u, count: ($vals|filter:$$ == $u)|count}
                }
              }
            }

            var.update $facet_counts {
              value = $facet_counts|push:{key: $fk, values: $counted}
            }
          }
        }
      }
    }

    var $total {
      value = $rows|count
    }

    var $start {
      value = ($input.page - 1) * $input.per_page
    }

    var $page_rows {
      value = $rows|slice:$start:$input.per_page
    }

    // Fitment of the attachments in scope: fitmap[attachment_sku] = [machine_sku, ...] (for a "Fits my machine" filter)
    db.query "fitment" {
      join = {
        products: {
          table: "products"
          type : "inner"
          where: $db.fitment.attachment_sku == $db.products.sku
        }
      }

      where = ($db.products.category_path includes $path) && $db.products.status != "draft"
      return = {type: "list"}
    } as $fitrows

    var $fitmap {
      value = {}
    }

    foreach ($fitrows) {
      each as $f {
        var.update $fitmap {
          value = $fitmap|set:$f.attachment_sku:(($fitmap|get:$f.attachment_sku:[])|push:$f.machine_sku)
        }
      }
    }

    // Each listed product carries its facet specs (key_specs: {facet_key: value}) and, for an attachment, the machines it
    // fits (fits: [machine_sku]), so a listing card needs no detail call.
    var $items {
      value = []
    }

    foreach ($page_rows) {
      each as $p {
        var.update $items {
          value = $items|push:(($p|set:"key_specs":($specmap|get:$p.sku:{}))|set:"fits":($fitmap|get:$p.sku:[]))
        }
      }
    }
  }

  response = {
    items   : $items
    page    : $input.page
    per_page: $input.per_page
    total   : $total
    facets  : {status: $status_counts, specs: $facet_counts}
  }
  guid = "ucQxFdRTt4YiAkMV5skFt0IAXXI"
}
