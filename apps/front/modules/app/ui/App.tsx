'use client'

import { logClient } from "../lib/helper/logClient";
import { LoadingScreen } from "@/modules/shared";
import { useApp } from "../lib/hooks/app";


export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading } = useApp();
    logClient('Afa start', {
        level: 'info',
        context: 'Alfa LOG TEST',
        message: 'Alfa is mounted',
    });
    return (

        <div className="min-h-screen bg-background">


            {initialized && !isLoading ? (
                children
            ) : (
                <LoadingScreen />
            )}
        </div>

    );
}

// const AppRoot = ({ inBitrix }: { inBitrix: boolean }) => {
//     const dispatch = useAppDispatch();
//     const app = useAppSelector((state) => state.app);
//     const [isClient, setIsClient] = useState(false);

//     useEffect(() => {
//         setIsClient(true);
//     }, []);

//     useEffect(() => {
//         if (isClient && !app.initialized && !app.isLoading) {
//             dispatch(initial(inBitrix));
//         }
//     }, [isClient, app.initialized, app.isLoading, dispatch, inBitrix]);

//     if (!isClient) {
//         return <LoadingScreen />;
//     }
//     logClient('Afa start', {
//         level: 'info',
//         context: 'Alfa LOG TEST',
//         message: 'Alfa is mounted',
//     });
//     return (

//         <div className="min-h-screen bg-background">


//             {app.initialized ? (
//                 <AppContent />
//             ) : (
//                 <StartPage />
//             )}
//         </div>

//     );
// };

// const AppContent = () => {
//     return <MainPage />
// };

export default App