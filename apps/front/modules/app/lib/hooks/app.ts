"use client"
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { initial, reloadApp } from "../../model/AppThunk";

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state) => state.app);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !app.initialized && !app.isLoading) {
            dispatch(initial());
        }
    }, [isClient, app.initialized, app.isLoading, dispatch]);


    return { isClient, app, initialized: app.initialized, isLoading: app.isLoading };
}
export const useReload = () => {
    const dispatch = useAppDispatch();
    const { isLoading, isReloading } = useAppSelector((state) => state.app)
    const reload = () => {
        dispatch(reloadApp());

    }
    return { reload, isLoading, isReloading };
}


