import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const createAuctionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  startingBid: z.number().min(1, 'Starting bid must be at least $1'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  image: z.string().url('Please provide a valid image URL'),
});

type CreateAuctionForm = z.infer<typeof createAuctionSchema>;

const categories = [
  'Collectibles',
  'Jewelry & Watches',
  'Furniture',
  'Books & Media',
  'Music & Audio',
  'Fashion & Accessories',
  'Electronics',
  'Art & Antiques',
  'Sports & Hobbies',
  'Other'
];

export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const { createAuction, isAuthenticated } = useAuction();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAuctionForm>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startingBid: 1,
      duration: 24,
      image: '',
    },
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: CreateAuctionForm) => {
    setIsSubmitting(true);
    try {
      const success = createAuction({
        title: data.title,
        description: data.description,
        category: data.category,
        startingBid: data.startingBid,
        duration: data.duration,
        image: data.image,
      });
      if (success) {
        navigate('/my-listings');
      }
    } catch (error) {
      console.error('Failed to create auction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Auction</h1>
        <p className="text-muted-foreground mt-2">List your item for auction</p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter auction title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item in detail"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startingBid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Bid ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="100.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Auction'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/my-listings')}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </main>
  );
}