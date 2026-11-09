import assert from "node:assert/strict";
import { Follow } from "./Follow";
import { FollowDAO } from "./FollowDAO";
import { User } from "./User";

async function main(): Promise<void> {
  const dao = new FollowDAO();
  const follower = new User("Demo", "Follower", "@dao-demo-follower", "");
  const followee = new User("Demo", "Followee", "@dao-demo-followee", "");

  // These groups use distinct keys, so all 50 relationships are unique.
  for (let i = 1; i <= 25; i++) {
    await dao.put(new Follow(follower, new User("Followee", `${i}`, `@dao-demo-followee-${i}`, "")));
  }
  console.log("Inserted 25 items with the same follower.");

  for (let i = 1; i <= 25; i++) {
    await dao.put(new Follow(new User("Follower", `${i}`, `@dao-demo-follower-${i}`, ""), followee));
  }
  console.log("Inserted 25 items with the same followee.");

  const key = [follower.alias, "@dao-demo-followee-1"] as const;
  const item = await dao.get(...key);
  assert.deepEqual(item, {
    follower_handle: key[0],
    follower_name: "Demo Follower",
    followee_handle: key[1],
    followee_name: "Followee 1",
  });
  console.log("Get passed:", item);

  const updated = await dao.update(...key, "Updated Follower", "Updated Followee");
  assert.equal(updated.follower_name, "Updated Follower");
  assert.equal(updated.followee_name, "Updated Followee");
  assert.deepEqual(await dao.get(...key), updated);
  console.log("Update passed:", updated);

  await dao.delete(...key);
  assert.equal(await dao.get(...key), undefined);
  console.log("Delete passed. 49 demo items remain in follows.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
