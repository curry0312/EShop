import { atom } from "jotai";

export const activeSideBarItem = atom<string>("/dashboard");


type NavItemsType = {
    title: string;
    href: string;
}

export const navItems: NavItemsType[] = [
    {
        title: "Home",
        href: "/",
    },
    {
        title: "Products",
        href: "/products",
    },
    {
        title: "Shops",
        href: "/shops",
    },
    {
        title: "Offers",
        href: "/offers",
    },
    {
        title: "Become a seller",
        href: "/become-a-seller",
    },
];
