// GET /products/{sku}/compatible-attachments: current attachments that fit a machine, grouped by attachment subcategory.
query "products/{sku}/compatible-attachments" verb=GET {
  api_group = "pim"
  description = "Attachments that fit a machine, grouped by subcategory."

  input {
    text sku filters=trim
    text? subcategory? filters=trim|lower
  }

  stack {
    db.get "products" {
      field_name = "sku"
      field_value = $input.sku
    } as $machine

    precondition ($machine != null && $machine.status != "draft") {
      error_type = "notfound"
      error = "Unknown product"
    }

    db.query "fitment" {
      join = {
        products: {
          table: "products"
          type : "inner"
          where: $db.fitment.attachment_sku == $db.products.sku
        }
      }

      where = $db.fitment.machine_sku == $input.sku && $db.products.status == "active"
      eval = {
        sku                : $db.products.sku
        slug               : $db.products.slug
        model              : $db.products.model
        name               : $db.products.name
        hero_image_url     : $db.products.hero_image_url
        category_id        : $db.products.category_id
        category_path      : $db.products.category_path
        hydraulics_required: $db.products.hydraulics_required
      }

      return = {type: "list"}
    } as $rows

    db.query "categories" {
      return = {type: "list"}
    } as $cats

    var $groups {
      value = {}
    }

    var $cat {
      value = null
    }

    var $g {
      value = null
    }

    foreach ($rows) {
      each as $r {
        var.update $cat {
          value = $cats|find:$$.id == $r.category_id
        }

        conditional {
          if ($cat != null && ($input.subcategory == null || $input.subcategory == "" || $cat.slug == $input.subcategory)) {
            var.update $g {
              value = $groups|get:$cat.slug:{slug: $cat.slug, name: $cat.name, sort: $cat.sort, items: []}
            }

            var.update $g {
              value = $g|set:"items":($g.items|push:$r)
            }

            var.update $groups {
              value = $groups|set:$cat.slug:$g
            }
          }
        }
      }
    }
  }

  response = {machine_sku: $input.sku, groups: $groups|values}
  guid = "ewVDJlEXU2buzMfYC8Q3Dyg5qmE"
}
