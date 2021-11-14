import { useAccount, useOwnedCourse } from "@components/hooks/web3";
import { Modal } from "@components/ui/common"
import { CourseHero, Curriculum, Keypoint } from "@components/ui/course"
import { BaseLayout } from "@components/ui/layout"
import { getAllCourses } from "@content/courses/fetcher";

export default function Course({ course }) {
  const { account } = useAccount();
  const { ownedCourse } = useOwnedCourse(course, account.data);

  console.log(ownedCourse);
  return (
    <BaseLayout>
    <div className="py-4">
      <CourseHero 
        title={course.title}
        description={course.description}
        image={course.coverImage} 
      />
      <Keypoint points={course.wsl} />
      <Curriculum locked={true} />
      <Modal />
    </div>
    </BaseLayout>
  )
}

export function getStaticPaths() {
  const { data } = getAllCourses();

  return {
    paths: data.map(course => ({
      params: {
        slug: course.slug
      }
    })),
    fallback: false
  }
}

export function getStaticProps({ params }) {
  const { data } = getAllCourses();
  const course = data.filter(course => course.slug === params.slug)[0];

  return {
    props: {
      course
    }
  }
}