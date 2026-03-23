import { savePost } from './src/lib/posts';

async function test() {
  console.log("Testing savePost...");
  try {
    const success = await savePost({
      title: "Test Post 123",
      slug: "test-post-123",
      date: "Mar 24, 2026",
      content: "Hello World"
    });
    console.log("Success?", success);
  } catch (err) {
    console.error("Caught error in test:", err);
  }
  process.exit(0);
}

test();
