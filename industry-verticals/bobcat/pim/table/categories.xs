// Category tree of the PIM. A leaf category is a Sitecore subcategory page that holds a wildcard (*) item.
table categories {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text name filters=trim

    // URL segment of the category page, unique across the tree (e.g. compact-mini-excavators)
    text slug filters=trim|lower

    // Parent category; empty for a top-level category
    int parent_id? {
      table = "categories"
    }

    // Path of the matching Sitecore page, no trailing slash (e.g. /equipment/excavators/compact-mini-excavators)
    text sitecore_path filters=trim|lower

    int sort?=0
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "slug"}]}
    {type: "btree|unique", field: [{name: "sitecore_path"}]}
    {type: "btree", field: [{name: "parent_id"}]}
  ]
  guid = "KsCydZsr_0IKjdK9xv6uiQAotKQ"
}
