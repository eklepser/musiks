using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Clothing
{
    public int clothing_id { get; set; }

    public int merch_id { get; set; }

    public string? size { get; set; }

    public string? gender { get; set; }

    public virtual Merch merch { get; set; } = null!;
}
