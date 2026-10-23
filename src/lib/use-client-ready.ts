"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
/** Avoid losing an interaction on server-rendered controls before hydration. */
export function useClientReady() { return useSyncExternalStore(subscribe, clientReady, serverReady); }
