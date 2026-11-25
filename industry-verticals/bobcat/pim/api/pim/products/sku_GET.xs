// GET /products/{sku}: one product with specs, category and successor. Drafts are not found.
query "products/{sku}" verb=GET {
  api_group = "pim"
  description = "Product by SKU."

  input {
    text sku filters=trim
  }

  stack {
    db.get "products" {
      field_name = "sku"
      field_value = $input.sku
    } as $product

    precondition ($product != null && $product.status != "draft") {
      error_type = "notfound"
      error = "Unknown product"
    }

    function.run "product_detail" {
      input = {product: $product}
    } as $detail
  }

  response = $detail
  guid = "oFaYW3_bSyod0P1BDOnsbsyXVcI"
}
