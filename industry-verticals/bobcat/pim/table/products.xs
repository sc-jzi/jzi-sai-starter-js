// Machines and attachments. The PIM is the source of truth; Sitecore only holds sparse enrichment by SKU.
table products {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text sku filters=trim

    // Lower-case model plus configuration (e.g. e32, e32-long-arm); unique within its category
    text slug filters=trim|lower

    text model filters=trim
    text name filters=trim

    // Leaf category the product belongs to
    int category_id {
      table = "categories"
    }

    // Copy of the leaf category's sitecore_path WITH a trailing slash, so a parent category matches by prefix
    text category_path filters=trim|lower

    enum product_kind?="machine" {
      values = ["machine", "attachment"]
    }

    enum status?="active" {
      values = ["active", "discontinued", "draft"]
    }

    date discontinued_on?
    text successor_sku? filters=trim

    // e.g. "2014-2021"
    text model_years? filters=trim

    text summary?

    // Illustrative price
    decimal msrp? filters=min:0

    text hero_image_url? filters=trim
    text[] gallery_urls?

    enum data_origin?="illustrative" {
      values = ["real", "illustrative"]
    }

    // Machines
    enum carrier_type? {
      values = ["compact_excavator", "large_excavator", "compact_track_loader", "utility_tractor", "concept"]
    }

    // e.g. Bob-Tach, X-Change, pin-on, 3-point hitch (machines and attachments)
    text coupler? filters=trim

    enum aux_hydraulics? {
      values = ["none", "standard", "high_flow"]
    }

    // Attachments
    text[] carrier_types?

    enum hydraulics_required? {
      values = ["none", "standard", "high_flow"]
    }

    decimal min_operating_weight? filters=min:0
    decimal max_operating_weight? filters=min:0

    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "sku"}]}
    {type: "btree|unique", field: [{name: "category_id"}, {name: "slug"}]}
    {type: "btree", field: [{name: "category_path"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "product_kind"}]}
  ]
  guid = "WwZV-EinuL-pwABSUQ5RDpi4ftQ"
}
