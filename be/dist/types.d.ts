import zod from "zod";
export declare const SignupSchema: zod.ZodObject<{
    email: zod.ZodEmail;
    password: zod.ZodString;
    role: zod.ZodEnum<{
        User: "User";
        Admin: "Admin";
    }>;
}, zod.z.core.$strip>;
export declare const SigninSchema: zod.ZodObject<{
    email: zod.ZodEmail;
    password: zod.ZodString;
}, zod.z.core.$strip>;
export declare const SweetShopSignUp: zod.ZodObject<{
    name: zod.ZodString;
    password: zod.ZodString;
    email: zod.ZodEmail;
    role: zod.ZodEnum<{
        User: "User";
        Admin: "Admin";
    }>;
}, zod.z.core.$strip>;
export declare const SweetShopSignIn: zod.ZodObject<{
    name: zod.ZodString;
    password: zod.ZodString;
}, zod.z.core.$strip>;
export declare const SweetSchema: zod.ZodObject<{
    name: zod.ZodString;
    category: zod.ZodString;
    price: zod.ZodNumber;
    image: zod.ZodString;
    quantity: zod.ZodNumber;
}, zod.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map