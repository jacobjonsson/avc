import {z} from "zod";

const insertTypeSchema = z.object({
  type: z.literal("insert"),
  text: z.string(),
  index: z.number(),
});

const deleteTypeSchema = z.object({
  type: z.literal("delete"),
  index: z.number(),
  length: z.number(),
});

export const createMutationSchema = z.object(
  {
    conversationId: z.string({
      required_error: "conversationId is required",
      invalid_type_error: "conversationId must be a string",
    }),

    author: z.union([z.literal("alice"), z.literal("bob")], {
      required_error: "author is required",
      invalid_type_error: "author must be one of [alice, bob]",
    }),

    data: insertTypeSchema.or(deleteTypeSchema),

    origin: z.object(
      {
        alice: z.number({
          required_error: "origin.alice is required",
          invalid_type_error: "origin.alice must an integer",
        }),
        bob: z.number({
          required_error: "origin.bob is required",
          invalid_type_error: "origin.bob must an integer",
        }),
      },
      {
        required_error: "origin is required",
        invalid_type_error: "origin must an object",
      }
    ),
  },
  {
    required_error: "body is required",
    invalid_type_error: "body must an object",
  }
);
