using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models;

public partial class Product
{
    public int product_id { get; set; }

    public string name { get; set; } = null!;

    public decimal price { get; set; }

    public string? description { get; set; }

    public int stock { get; set; }

    public int? manufacturer_id { get; set; }

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    public virtual Merch? Merch { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Ticket? Ticket { get; set; }

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();

    public virtual Manufacturer? manufacturer { get; set; }
    
    [NotMapped]
    public virtual ICollection<Genre> genres { get; set; } = new List<Genre>();
}
