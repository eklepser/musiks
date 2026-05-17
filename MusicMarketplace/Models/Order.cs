using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Order
{
    public int order_id { get; set; }

    public int user_id { get; set; }

    public DateTime order_date { get; set; }

    public string status { get; set; } = null!;

    public decimal total_amount { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual User user { get; set; } = null!;
}
