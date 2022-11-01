import { Page } from "puppeteer";




export interface IPageEventMiddleware{
    bind: (page: Page) => void;
}