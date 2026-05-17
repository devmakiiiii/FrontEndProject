import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Auction } from '@/lib/types';

const editAuctionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  starting_price: z.number().min(1, 'Starting price must be at least $1'),
  end_time: z.string().min(1, 'End time is required'),
  images: z.array(z.instanceof(File)).optional(),
});

type EditAuctionForm = z.infer<typeof editAuctionSchema>;

const categories = [
  { id: '1', name: 'Collectibles' },
  { id: '2', name: 'Jewelry & Watches' },
  { id: '3', name: 'Furniture' },
  { id: '4', name: 'Books & Media' },
  { id: '5', name: 'Music & Audio' },
  { id: '6', name: 'Fashion & Accessories' },
  { id: '7', name: 'Electronics' },
  { id: '8', name: 'Art & Antiques' },
  { id: '9', name: 'Sports & Hobbies' },
];

export default function EditAuctionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { auctions, updateAuction, isAuthenticated, isLoading } = useAuction();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditAuctionForm>({
    resolver: zodResolver(editAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      starting_price: 1,
      end_time: '',
      images: [],
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

useEffect(() => {
     if (id && auctions.length > 0) {
       const found = auctions.find(a => a.id === id);
       if (found) {
         setAuction(found);
         const endTimeValue = found.endTime instanceof Date 
           ? found.endTime.toISOString().slice(0, 16) 
           : new Date(found.endTime).toISOString().slice(0, 16);
         const categoryId = categories.find(c => c.name === found.category)?.id || '';
         form.reset({
           title: found.title,
           description: found.description,
           category_id: categoryId,
           starting_price: found.startingBid,
           end_time: endTimeValue,
           images: [],
         });
       }
     }
   }, [id, auctions, form]);

  const onSubmit = async (data: EditAuctionForm) => {
    if (!auction) return;
    setIsSubmitting(true);
    try {
      const success = await updateAuction(auction.id, {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        starting_price: data.starting_price,
        end_time: data.end_time,
        images: data.images,
      });
      if (success) {
        navigate('/my-listings');
      }
    } catch (error) {
      console.error('Failed to update auction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!auction) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Auction not found or loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Auction</h1>
        <p className="text-muted-foreground mt-2">Update your auction listing</p>
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
                name="category_id"
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
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="starting_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="100.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {auction?.image && (
              <div>
                <FormLabel>Current Image</FormLabel>
                <div className="mt-2">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="max-h-48 rounded-lg border object-cover"
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images (optional - new images will replace existing)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => field.onChange(e.target.files ? Array.from(e.target.files) : [])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Auction'}
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