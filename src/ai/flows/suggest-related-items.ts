'use server';

/**
 * @fileOverview AI flow to suggest related or popular items based on the current items in the cart.
 *
 * - suggestRelatedItems - A function that suggests related items for the cashier.
 * - SuggestRelatedItemsInput - The input type for the suggestRelatedItems function.
 * - SuggestRelatedItemsOutput - The return type for the suggestRelatedItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedItemsInputSchema = z.object({
  cartItems: z
    .array(
      z.string().describe('The name of an item in the current shopping cart.')
    )
    .describe('A list of item names currently in the cart.'),
});
export type SuggestRelatedItemsInput = z.infer<
  typeof SuggestRelatedItemsInputSchema
>;

const SuggestRelatedItemsOutputSchema = z.object({
  suggestedItems: z
    .array(
      z
        .string()
        .describe(
          'A list of suggested item names that are related to the items in the cart.'
        )
    )
    .describe('A list of suggested item names to increase sales.'),
});
export type SuggestRelatedItemsOutput = z.infer<
  typeof SuggestRelatedItemsOutputSchema
>;

export async function suggestRelatedItems(
  input: SuggestRelatedItemsInput
): Promise<SuggestRelatedItemsOutput> {
  return suggestRelatedItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedItemsPrompt',
  input: {schema: SuggestRelatedItemsInputSchema},
  output: {schema: SuggestRelatedItemsOutputSchema},
  prompt: `You are a retail expert. Given the following items in the cart, suggest other items that the cashier could offer to the customer to increase sales.

Cart Items:
{{#each cartItems}}- {{this}}\n{{/each}}

Suggested Items:`,
});

const suggestRelatedItemsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedItemsFlow',
    inputSchema: SuggestRelatedItemsInputSchema,
    outputSchema: SuggestRelatedItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
