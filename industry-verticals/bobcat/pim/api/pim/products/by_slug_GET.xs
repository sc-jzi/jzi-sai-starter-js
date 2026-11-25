// GET /products/by-slug/{category_slug}/{slug}: the lookup the site's wildcard route uses.
// The slug must belong to that exact leaf category: the same slug under another category is a 404 (no duplicate URLs).
query "products/by-slug/{category_slug}/{slug}" verb=GET {
  api_group = "pim"
  description = "Product by leaf category slug and product slug."

  input {
    text category_slug filters=trim|lower
    text slug filters=trim|lower
  }

  stack {
    db.get "categories" {
      field_name = "slug"
      field_value = $input.category_slug
    } as $cat

    precondition ($cat != null) {
      error_type = "notfound"
      error = "Unknown category"
    }

    db.query "products" {
      where = $db.products.category_id == $cat.id && $db.products.slug == $input.slug && $db.products.status != "draft"
      return = {type: "single"}
    } as $product

    precondition ($product != null) {
      error_type = "notfound"
      error = "Unknown product"
    }

    function.run "product_detail" {
      input = {product: $product}
    } as $detail
  }

  response = $detail
  guid = "IIBaP2Sq8ACy56Sj5gGVSktzCVg"
}
