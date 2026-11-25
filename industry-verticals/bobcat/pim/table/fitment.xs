// Which attachment fits which machine. Published pairs come from the manufacturer; rule pairs are derived once at load time.
table fitment {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text attachment_sku filters=trim
    text machine_sku filters=trim

    enum source?="rule" {
      values = ["published", "rule"]
    }

    // e.g. "requires high-flow kit"
    text notes? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "attachment_sku"}, {name: "machine_sku"}]}
    {type: "btree", field: [{name: "machine_sku"}]}
  ]
  guid = "zYpsrmy0S85EycWcAnhYb48RPrs"
}
