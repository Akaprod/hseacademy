import { db } from '../src/lib/db';
async function main() {
  const courses = await db.onlineCourse.findMany({select:{slug:true,title:true}, orderBy:{order:'asc'}});
  for (const c of courses) console.log(c.slug, '-', c.title);
  console.log(`Total: ${courses.length}`);
  await db.$disconnect();
}
main().catch(console.error);