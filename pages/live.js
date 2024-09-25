import Layout from "@/components/Layout";
import LiveScoreFeed from "@/components/LiveScoreFeed";

export default function LivePage(){
    return(
        <Layout>
                <div className="max-w-md mx-auto px-4 py-6">

                <h1 className="text-2xl font-bold mb-4"></h1>
                <LiveScoreFeed />
            </div>
        </Layout>
    )
}