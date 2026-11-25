// GET /sitemap/products: what the product sitemap may list (drafts excluded). The site skips slugs that have a real Sitecore item.
// Not /products/sitemap: that path would collide with /products/{sku}.
query "sitemap/products" verb=GET {
  api_group = "pim"
  description = "Slugs, paths and dates for the product sitemap."

  input {
    text? category? filters=trim|lower
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
      where = ($db.products.category_path includes $path) && $db.products.status != "draft"
      sort = {category_path: "asc"}
      return = {type: "list"}
    } as $rows

    var $out {
      value = $rows|map:{sku: $$.sku, slug: $$.slug, category_path: $$.category_path, status: $$.status, updated_at: $$.updated_at}
    }
  }

  response = $out
  guid = "UdkdsGuFFtIActs-AOpqgVBp3sQ"
}
