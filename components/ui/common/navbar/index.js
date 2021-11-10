import { useWeb3 } from "@components/providers";
import { Button } from "@components/ui/common";
import { useRouter } from "next/dist/client/router";
import { useNetwork, useAccount } from "@components/hooks/web3";
import ActiveLink from "@components/ui/link";


export default function Navbar() {
  const { connect, isLoading, requireInstall } = useWeb3();
  // const _useAccount = useAccount(web3);
  // const { account } = _useAccount();
  // const { account } = useAccount(web3)();
  // const { account } = hooks.useAccount();

  const { account } = useAccount();
  const { pathname } = useRouter();
  const { network } = useNetwork();

    return (
        <>
        <section>
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav className="relative" aria-label="Global">
                <div className="flex justify-between">
                  <div>
                  <ActiveLink href="/">
                    <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">Home</a>
                  </ActiveLink>
                  <ActiveLink href="/marketplace">
                    <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">Marketplace</a>
                  </ActiveLink>
                   <ActiveLink href="/blogs">
                    <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">Blogs</a>
                  </ActiveLink>
                  </div>
                  <div>
                  <ActiveLink href="/wishlist">
                    <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">Wishlist</a>
                  </ActiveLink>
                  { isLoading ?
                    <Button 
                      disabled={true}
                      onClick={connect} 
                      className="px-8 py-3 border rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Loading...
                    </Button> :
                     account.data ?
                    <Button 
                      hoverable={false}
                      className="cursor-default">
                        Hi There {account.isAdmin && "Admin"}
                    </Button> :
                    requireInstall ? 
                    <Button onClick={() => window.open("https://metamask.io/download.html", "_blank")} 
                      className="px-8 py-3 border rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Install Metamask
                    </Button> :
                    <Button onClick={connect} 
                      className="px-8 py-3 border rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Connect
                    </Button>
                  }
                  
                  </div>
                </div>
              </nav>
            </div>
            { account.data && 
              !pathname.includes("/marketplace") &&
              <div className="flex justify-end pt-1 sm:px-6 lg:px-8">
                <div className="text-white bg-indigo-600 rounded-md p-2">
                  {account.data }
                </div>
              </div>
            }
          </section>
          </>
    );
}
