using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class User
{
    public int user_id { get; set; }

    public string login { get; set; } = null!;

    public string email { get; set; } = null!;

    public DateOnly registration_date { get; set; }

    public string full_name { get; set; } = null!;

    public string password_hash { get; set; } = null!;

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
