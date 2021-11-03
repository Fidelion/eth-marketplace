import { useWeb3 } from "@components/providers";
import { Breadcrumbs, Footer, Hero, Navbar } from "@components/ui/common";
import { CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";

export default function Home({ courses }) {
  const { test } = useWeb3();
  return (
      <BaseLayout>
          {test}
            <Hero />
            <CourseList courses={courses} />
      </BaseLayout>
  )
}

export function getStaticProps() {
  const { data } = getAllCourses();

  return {
    props: {
      courses: data
    }
  }
}