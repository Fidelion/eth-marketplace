import { Button, Message } from "@components/ui/common";

const { BaseLayout } = require("@components/ui/layout");
const { MarketHeader } = require("@components/ui/marketplace");
const { OrderCard } = require("@components/ui/order");

function OwnedCourses() {
    return(
     <>
        <div className="py-4">
            <MarketHeader />
        </div>
            <section className="grid grid-cols-1">
                <OrderCard>
                    <Message type="success">
                        My Custom Message
                    </Message>
                    <Button>
                        Watch the course
                    </Button>
                </OrderCard>
            </section>
        </>
    )
}

const Wrapper = ({...props}) =>
    <BaseLayout>
        <OwnedCourses {...props} />
    </BaseLayout>

export default Wrapper;