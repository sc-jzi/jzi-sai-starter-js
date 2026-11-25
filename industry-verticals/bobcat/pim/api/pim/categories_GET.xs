// GET /categories: the whole category tree (flat, with parent_id) and the number of visible products under each category.
query categories verb=GET {
  api_group = "pim"
  description = "Category tree with product counts (drafts excluded)."

  input {
  }

  stack {
    db.query "categories" {
      sort = {sort: "asc"}
      return = {type: "list"}
    } as $cats

    var $out {
      value = []
    }

    var $prefix {
      value = ""
    }

    foreach ($cats) {
      each as $c {
        var.update $prefix {
          value = $c.sitecore_path ~ "/"
        }

        db.query "products" {
          where = ($db.products.category_path includes $prefix) && $db.products.status != "draft"
          return = {type: "count"}
        } as $count

        var.update $out {
          value = $out|push:($c|set:"product_count":$count)
        }
      }
    }
  }

  response = $out
  guid = "SfaARhSw5WXWbdqQEPiSzxEsYo4"
}
