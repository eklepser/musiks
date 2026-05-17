using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class OrderItem
{
    public int order_id { get; set; }

    public int product_id { get; set; }

    public int quantity { get; set; }

    public decimal unit_price { get; set; }

    public virtual Order order { get; set; } = null!;

    public virtual Product product { get; set; } = null!;
}
