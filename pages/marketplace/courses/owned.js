import Link from "next/link";
import { useAccount, useOwnedCourses } from "@components/hooks/web3";
import { Button, Message } from "@components/ui/common";
import { getAllCourses } from "@content/courses/fetcher";
import { useRouter } from "next/dist/client/router";
import { useWeb3 } from "@components/providers";

const { BaseLayout } = require("@components/ui/layout");
const { MarketHeader } = require("@components/ui/marketplace");
const { OrderCard } = require("@components/ui/order");

function OwnedCourses({courses}) {
    const router = useRouter();
    const { requireInstall } = useWeb3();
    const { account } = useAccount();
    const { ownedCourses } = useOwnedCourses(courses, account.data);
    return(
     <>
        <MarketHeader />
        <section className="grid grid-cols-1">
        { ownedCourses.isEmpty &&
            <div>
                <Message type="warning">
                    <div>You don&apos;t own any course</div>
                    <Link href="/marketplace">
                        <a className="font-normal hover:underline">
                            <i>Purchase Course</i>
                        </a>
                    </Link>
                </Message>
            </div>
        }
        { account.isEmpty &&
            <div>
                <Message type="warning">
                    <div>Please Connect to Metamask</div>
                </Message>
            </div>
        }
        { requireInstall &&
            <div>
                <Message type="warning">
                    <div>Please install Metamask</div>
                </Message>
            </div>
        }
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