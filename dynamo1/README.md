# Follows DAO

The `follows` table must have a string partition key named `follower_handle`
and a string sort key named `followee_handle`.

`src/FollowDAO.ts` provides `put`, `get`, `update`, and `delete`. Insertions
accept the existing `Follow` model. Reads and updates return the four stored
attributes. A missing read returns `undefined`; updating a missing relationship
throws a conditional check error.

Install dependencies with `npm install`, then run `npm run typecheck`.

Configure AWS credentials using the standard AWS SDK credential chain and set
`AWS_REGION` to the region containing your table. For example, if your table is
in us-west-2:

```sh
AWS_REGION=us-west-2 npm test
```

The integration test writes to the actual `follows` table. It inserts 25 unique
relationships sharing one follower and another 25 sharing one followee. It
then reads an item by both key attributes, updates and verifies both names,
and deletes the item and verifies its absence. A successful run leaves 49
demo items. Handles start with `@dao-demo-`; rerunning overwrites these demo
relationships and repeats the checks.
