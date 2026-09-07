import { VAProductCodes } from "@/types/va_product_codes.type";

export const VA_PRODUCT_CODES: VAProductCodes = [
    {
        gateway_code: "NOBU",
        data_products: [
            { product_name: "OVO", products: [{ product_code: "00OVOTOPUP", is_closed_amount: false }] },
            { product_name: "GOPAY", products: [{ product_code: "GOPAYTOPUP", is_closed_amount: false }] },
            { product_name: "DANA", products: [{ product_code: "0DANATOPUP", is_closed_amount: false }] },
            {
                product_name: "LINKAJA",
                products: [
                    { product_code: "LINKA00VCR00001", is_closed_amount: false },
                    { product_code: "LINKA00VCR00002", is_closed_amount: false },
                    { product_code: "LINKA00VCR00003", is_closed_amount: false },
                    { product_code: "LINKA00VCR00004", is_closed_amount: false },
                    { product_code: "LINKA00VCR00005", is_closed_amount: false },
                ]
            },
            {
                product_name: "SHOPEEPAY",
                products: [
                    { product_code: "0SPAY00VCR00001", is_closed_amount: true, close_amount: 10000 },
                    { product_code: "0SPAY00VCR00002", is_closed_amount: true, close_amount: 20000 },
                    { product_code: "0SPAY00VCR00003", is_closed_amount: true, close_amount: 30000 },
                    { product_code: "0SPAY00VCR00004", is_closed_amount: true, close_amount: 40000 },
                    { product_code: "0SPAY00VCR00005", is_closed_amount: true, close_amount: 50000 },
                    { product_code: "0SPAY00VCR00006", is_closed_amount: true, close_amount: 60000 },
                    { product_code: "0SPAY00VCR00007", is_closed_amount: true, close_amount: 70000 },
                    { product_code: "0SPAY00VCR00008", is_closed_amount: true, close_amount: 80000 },
                    { product_code: "0SPAY00VCR00009", is_closed_amount: true, close_amount: 90000 },
                    { product_code: "0SPAY00VCR00010", is_closed_amount: true, close_amount: 100000 },
                    { product_code: "0SPAY00VCR00011", is_closed_amount: true, close_amount: 200000 },
                    { product_code: "0SPAY00VCR00012", is_closed_amount: true, close_amount: 300000 },
                    { product_code: "0SPAY00VCR00013", is_closed_amount: true, close_amount: 500000 },
                    { product_code: "0SPAY00VCR00014", is_closed_amount: true, close_amount: 700000 },
                    { product_code: "0SPAY00VCR00015", is_closed_amount: true, close_amount: 1000000 },
                ]
            },
        ]
    },
    {
        gateway_code: "LOKETBAYAR",
        data_products: [
            { product_name: "DANA", products: [{ product_code: "DANAPLUS", is_closed_amount: false }] },
            { product_name: "GOPAY", products: [{ product_code: "GOPAYP", is_closed_amount: false }] },
            { product_name: "OVO", products: [{ product_code: "OVOPLUSADM", is_closed_amount: false }] },
            { product_name: "SHOPEEPAY", products: [{ product_code: "SHOPEEPLUS", is_closed_amount: false }] },
            { product_name: "LINKAJA", products: [{ product_code: "LINKP", is_closed_amount: false }] },
            { product_name: "BIFAST", products: [{ product_code: "TRFBANK", is_closed_amount: false }] },
        ]
    },
    {
        gateway_code: "ICARE",
        data_products: [
            { product_name: "GOPAY", products: [{ product_code: "GOPAY", is_closed_amount: false }] },
            { product_name: "LINKAJA", products: [{ product_code: "LINKAJA", is_closed_amount: false }] },
            { product_name: "OVO", products: [{ product_code: "OVO", is_closed_amount: false }] },
            { product_name: "DANA", products: [{ product_code: "DANA", is_closed_amount: false }] },
            { product_name: "SHOPEEPAY", products: [{ product_code: "SHOPEEPAY", is_closed_amount: false }] },
            { product_name: "BIFAST", products: [{ product_code: "TRFBANK", is_closed_amount: false }] },
        ]
    }
]