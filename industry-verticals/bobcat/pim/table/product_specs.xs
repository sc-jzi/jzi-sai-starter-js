// Specification rows of a product, grouped for the specs table. Rows with a facet_key also feed listing and search facets.
table product_specs {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text sku filters=trim

    // Performance, Dimensions, Engine, ...
    text group filters=trim

    text label filters=trim
    text value filters=trim
    text unit? filters=trim

    // e.g. horsepower, dig_depth, operating_weight; empty when the row is not a facet
    text facet_key? filters=trim|lower

    int sort?=0
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sku"}, {name: "sort"}]}
    {type: "btree", field: [{name: "facet_key"}]}
  ]
  guid = "vldTSbHMBpunoS1h2CYueJVIJfs"
}
