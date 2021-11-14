import { useAccount, useOwnedCourses } from "@components/hooks/web3";
import { Button, Message } from "@components/ui/common";
import { getAllCourses } from "@content/courses/fetcher";
import { useRouter } from "next/dist/client/router";

const { BaseLayout } = require("@components/ui/layout");
const { MarketHeader } = require("@components/ui/marketplace");
const { OrderCard } = require("@components/ui/order");

function OwnedCourses({courses}) {
    const router = useRouter();
    const { account } = useAccount();
    const { ownedCourses } = useOwnedCourses(courses, account.data);
    return(
     <>
        <MarketHeader />
        <section className="grid grid-cols-1">
            {ownedCourses.data?.map(course => 
                <OrderCard key={course.id} course={course}>
                    <Message type="success">
                        My Custom Message
                    </Message>
                    <Button onClick={() => router.push(`/courses/${course.slug}`)}>
                        Watch the course
                    </Button>
                </OrderCard>
                )}
        </section>
    </>
    )
}

const Wrapper = ({...props}) =>
    <BaseLayout>
        <OwnedCourses {...props} />
    </BaseLayout>

export default Wrapper;

export function getStaticProps() {
    const { data } = getAllCourses();

    return {
        props: {
            courses: data
        }
    }
}