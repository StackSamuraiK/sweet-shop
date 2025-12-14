import zod from "zod";
export const SignupSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(6, "Minimum 6 characters is required for password"),
    role: zod.enum(["User", "Admin"])
});
export const SigninSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(6, "Minimum 6 characters is required for password"),
});
export const SweetShopSignUp = zod.object({
    name: zod.string().min(3, "Name should be more than 3 words"),
    password: zod.string().min(6, "Minimum 6 characters is required for password"),
    email: zod.email(),
    role: zod.enum(["User", "Admin"])
});
export const SweetShopSignIn = zod.object({
    name: zod.string().min(3, "Name should be more than 3 words"),
    password: zod.string().min(6, "Minimum 6 characters is required for password"),
});
export const SweetSchema = zod.object({
    name: zod.string(),
    category: zod.string(),
    price: zod.number(),
    image: zod.string(),
    quantity: zod.number()
});
//# sourceMappingURL=types.js.map