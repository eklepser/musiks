using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Ticket
{
    public int ticket_id { get; set; }

    public int concert_id { get; set; }

    public int product_id { get; set; }

    public string? seat_row { get; set; }

    public string? seat_number { get; set; }

    public string? price_category { get; set; }

    public virtual Concert concert { get; set; } = null!;

    public virtual Product product { get; set; } = null!;
}
