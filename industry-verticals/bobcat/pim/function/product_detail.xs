// Full product record for a product page: the product, its specs, its category and (when discontinued) its successor.
function product_detail {
  description = "Adds specs, category and successor to a product record."
  input {
    json product
  }

  stack {
    db.query "product_specs" {
      where = $db.product_specs.sku == $input.product.sku
      sort = {sort: "asc"}
      return = {type: "list"}
    } as $specs

    db.get "categories" {
      field_name = "id"
      field_value = $input.product.category_id
    } as $category

    var $successor {
      value = null
    }

    conditional {
      if ($input.product.successor_sku != null && $input.product.successor_sku != "") {
        db.get "products" {
          field_name = "sku"
          field_value = $input.product.successor_sku
        } as $next

        conditional {
          if ($next != null && $next.status != "draft") {
            var.update $successor {
              value = {
                sku           : $next.sku
                slug          : $next.slug
                model         : $next.model
                name          : $next.name
                hero_image_url: $next.hero_image_url
                category_path : $next.category_path
              }
            }
          }
        }
      }
    }

    var $detail {
      value = $input.product
    }

    var.update $detail {
      value = $detail|set:"specs":$specs
    }

    var.update $detail {
      value = $detail|set:"category":{id: $category.id, name: $category.name, slug: $category.slug, sitecore_path: $category.sitecore_path}
    }

    var.update $detail {
      value = $detail|set:"successor":$successor
    }
  }

  response = $detail
  guid = "mQ3uDd8otj7JXlCSmn44NCU9VI8"
}
