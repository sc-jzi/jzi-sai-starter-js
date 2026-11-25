// GET /products/{sku}/compatible-machines: the machines an attachment fits, current models first, previous models apart.
query "products/{sku}/compatible-machines" verb=GET {
  api_group = "pim"
  description = "Machines an attachment fits (current and previous)."

  input {
    text sku filters=trim
  }

  stack {
    db.get "products" {
      field_name = "sku"
      field_value = $input.sku
    } as $attachment

    precondition ($attachment != null && $attachment.status != "draft") {
      error_type = "notfound"
      error = "Unknown product"
    }

    db.query "fitment" {
      join = {
        products: {
          table: "products"
          type : "inner"
          where: $db.fitment.machine_sku == $db.products.sku
        }
      }

      where = $db.fitment.attachment_sku == $input.sku && $db.products.status != "draft"
      eval = {
        sku           : $db.products.sku
        slug          : $db.products.slug
        model         : $db.products.model
        name          : $db.products.name
        status        : $db.products.status
        hero_image_url: $db.products.hero_image_url
        category_path : $db.products.category_path
      }

      return = {type: "list"}
    } as $rows
  }

  response = {
    attachment_sku: $input.sku
    current       : $rows|filter:$$.status == "active"
    previous      : $rows|filter:$$.status == "discontinued"
  }
  guid = "fsfugct-EpZXsOvFX6oOTjM6zLs"
}
