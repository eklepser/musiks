using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Wishlist
{
    public int user_id { get; set; }

    public int product_id { get; set; }

    public DateTime added_date { get; set; }

    public virtual Product product { get; set; } = null!;

    public virtual User user { get; set; } = null!;
}
