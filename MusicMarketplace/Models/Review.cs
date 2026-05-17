using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Review
{
    public int user_id { get; set; }

    public int product_id { get; set; }

    public int rating { get; set; }

    public string? review_text { get; set; }

    public DateTime review_date { get; set; }

    public virtual Product product { get; set; } = null!;

    public virtual User user { get; set; } = null!;
}
