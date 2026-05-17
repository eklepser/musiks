using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Accessory
{
    public int accessory_id { get; set; }

    public int merch_id { get; set; }

    public string? accessory_type { get; set; }

    public decimal? weight { get; set; }

    public virtual Merch merch { get; set; } = null!;
}
