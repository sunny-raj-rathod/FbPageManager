﻿using System.Collections.Generic;

namespace FacebookSEInterview.Models
{
    public class PageManagerPagePostsInfo
    {
        public List<PageManagerPagePost> Data { get; set; }
        public string NextPageUrl { get; set; }

        public PageManagerPagePostsInfo()
        {
            Data = new List<PageManagerPagePost>();
        }
    }
}
