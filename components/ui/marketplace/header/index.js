import { Breadcrumbs } from "@components/ui/common";
import { EthRates, Wallet } from "@components/ui/web3";

const LINKS = [
    {
        href: "/marketplace",
        value: "Buy"
    },
    {
        href: "/marketplace/courses/owned",
        value: "My Courses"
    },
    {
        href: "/marketplace/courses/manage",
        value: "Manage Courses"
    },

]

export default function Header() {
    return(
        <>
        <Wallet />
          <EthRates />
          <div className="flex flex-row-reverse py-4 p-x4 sm:px-6 lg:px-8">
          <Breadcrumbs items={LINKS}/>
          </div>
        </>
    )
}