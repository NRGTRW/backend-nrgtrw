import { z } from "zod";

const adressSchema = z.object({
  street: z.string().max(125),
  city: z.string().max(60),
  province: z.string().max(60),
  postalCode: z.number().int().positive().lte(99999).gte(1000)
});

export const createProfileSchema = z
  .object({
    username: z.string().min(5).max(15),
    email: z.string().email(),
    // TODO: Add phone number validation
    countryCode: z.string().regex(/^(\+?\d{1,3}|\d{1,4})$/),
    phoneNumber: z.string(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,60}$/
      ),
    address: adressSchema.strict()
  })
  .strict();

export const editProfileSchema = z
  .object({
    username: z.string().min(5).max(15).optional(),
    email: z.string().email().optional(),

    // TODO: Add phone number validation
    countryCode: z
      .string()
      .regex(/^(\+?\d{1,3}|\d{1,4})$/)
      .optional(),
    phoneNumber: z.string().optional,
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,60}$/
      )
      .optional(),
    address: adressSchema.partial().strict()
  })
  .strict();
