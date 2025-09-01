import React, { useState, useEffect } from "react";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Hardcoded articles
const hardcodedArticles = [
  {
    title: "What are the five Rs of waste management?",
    image: "/images/images.jpeg",
    excerpt: "A waste management system is a streamlined process...",
    content: `A waste management system is a streamlined process that organizations use to dispose of, reduce, reuse, and prevent waste. It involves several methods such as recycling, composting, and waste-to-energy conversion. Proper waste management helps reduce environmental pollution and promotes sustainability.
      
      The Five Rs of waste management provide a framework for minimizing waste before resorting to recycling. These steps are:
      
      1. Refuse: Avoid acquiring unnecessary items or waste in the first place. For instance, businesses can refuse products with excessive packaging.
      
      2. Reduce: Reduce the amount of waste you generate. A simple action like printing on both sides of paper reduces paper waste.
      
      3. Reuse: Reuse items instead of discarding them after one use. This includes using reusable bags, bottles, or containers to avoid single-use plastics.
      
      4. Repurpose: If an item can't be reused in its original form, find a new use for it. Repurposing or upcycling can give an item a second life, like turning old furniture into something new.
      
      5. Recycle: Recycling should be the last resort after trying all the other Rs. This involves processing materials to create new products, thus reducing the need for raw materials and minimizing waste in landfills.
    
      By following the Five Rs, waste can be managed more effectively and sustainably, reducing environmental impact and promoting a circular economy.`,
    date: "15 Feb 2024",
    category: "Research Articles",
    author: "Adam Smith",
    link: "/articles/article-01"
  },
  {
    title: "The Importance of Waste Management",
    image: "/images/download.jpeg",
    excerpt: "As long as we are producing waste, it will need to be managed...",
    content: "As long as we are producing waste, it will need to be managed. And we produce a lot of it: over two billion metric tons of MSW are generated globally every year, a figure that's expected to grow by about 70% by 2050.\n\nIt's clear that waste must be managed. But the way in which we manage the waste matters, too – when it's managed properly, it can do a lot of great things for the environment.\n\nReduces plastic pollution: By reducing the amount of waste that gets disposed of in landfills or littered in the environment, and instead repurposing or recycling existing materials, we can reduce plastic pollution across the board.\n\nThis, in turn, would help keep toxins out of soil and groundwater, as well as make the oceans safer for wildlife.\n\nAvoids landfill buildup: The less waste we need to dispose of, the less it builds up in landfills – which is important since the US alone sends nearly 150 million tons of garbage into landfills each year instead of recycling it.\n\nAnd when that reduced amount of waste does need to be managed, we can instead handle it in ways that produce electricity or steam power.\n\nImproves living conditions: Proper waste management means less contamination of our air, groundwater, and soil – which means higher quality food products and healthier wildlife.\n\nWell-organized, formal waste management also means that the workers handling the waste will have better pay and better protection from hazardous materials.\n\nEncourages a circular economy: Because waste management is all about reducing the amount of waste we produce and minimizing the impact of existing waste, it fits neatly into the structure of a circular economy in which products and materials are repurposed at the end of their lifecycle.",
    date: "10 Jan 2024",
    category: "Research Articles",
    author: "Jane Doe",
    link: "/articles/the-importance-of-waste-management"
  },
  {
    title: "Global Problems with Waste Management",
    image: "/images/images (2).jpeg",
    excerpt: "The World Bank estimates that at least 33% of today's waste is mismanaged around the world through open dumping or burning...",
    content: "The World Bank estimates that at least 33% of today's waste is mismanaged around the world through open dumping or burning.\n\nThese practices can have big consequences: residue from burning contaminates soil and groundwater, and can even enter our food chain via crops and livestock. Open burning also releases pollutants like CO2 into the atmosphere.\n\nIt doesn't have to be burning, either – landfill mismanagement on its own causes toxic metal pollution in water, soil, and crops.\n\nOften, low-income countries are unable to build the proper infrastructure for waste management, because it's such an expensive process – the market was valued at $1.3 trillion in 2022, with a projected growth rate of 5.4% from 2023 to 2030.\n\nWhich countries lack efficient waste management?\nOne survey of 38 countries found that Turkey, Latvia, and Chile have the worst waste management, owing to factors like the amount of waste that's recycled vs the amount that's disposed of in landfills.\n\nTurkey recycled 47 kg per capita in 2022, while almost 347 kg was left in landfills. In Latvia, 155 kg was recycled and 253 kg dumped into landfills, while Chile recycled only 2 kg of its waste and left 417 kg in landfills.\n\nHowever, this study didn't take most Asian countries into account, and this region's stats are also worth noting. In fact, the World Bank estimates that the urban areas of Asia produce about 760,000 tons of MSW per day, and open waste dumping has become the most common method in Asia's low and middle-income countries.\n\nOf course, prevention is the best medicine, and by that logic, the best waste management approach is to produce less waste. This means that the countries generating the most municipal waste – namely, the United States, China, and Germany – have a lot to answer for, regardless of how they manage it.\n\nFind out more by visiting our page on The Most Polluted Countries in the World.",
    date: "30 Jan 2024",
    category: "Waste Management",
    author: "John Doe",
    link: "/articles/global-problems-with-waste-management"  
  },
  {
    title: "Waste Management in Sri Lanka: Challenges and Opportunities",
    image: "/images/download (2).jpeg",
    excerpt: "Waste management in Sri Lanka faces numerous challenges, but there are also opportunities for sustainable solutions to reduce environmental impact.",
    content: `Waste management in Sri Lanka is an ongoing issue due to rapid urbanization, population growth, and an increase in waste production. While the country has made strides in waste management, it still faces numerous challenges. However, there are opportunities for sustainable solutions to improve waste management systems and reduce environmental impact.
      
      Challenges:
      
      1. Inadequate Infrastructure:
       Despite efforts, Sri Lanka's waste management infrastructure is still underdeveloped, particularly in rural areas. The collection, disposal, and treatment of waste are often inefficient and lack the necessary technologies for proper waste processing.
      
      2. Plastic Waste: 
      Sri Lanka is grappling with an overwhelming amount of plastic waste. Single-use plastics, such as bottles, bags, and packaging, are major contributors to pollution, and the country has struggled to implement effective plastic waste management policies.
    
      3. Public Awareness: 
      Many citizens are not fully aware of the impact of improper waste disposal or the benefits of recycling. Educational campaigns are needed to change attitudes and behaviors toward waste management.
    
      4. Informal Waste Collection:
       A significant portion of waste collection and recycling is handled informally by waste pickers, who face hazardous working conditions. This informal sector needs to be better integrated into the formal waste management system to ensure both efficiency and workers' safety.
    
      Opportunities:
    
      1. Recycling Initiatives:
       There are emerging opportunities in the recycling sector. Programs like segregating waste at source, improving waste collection methods, and increasing the number of recycling facilities can help reduce the amount of waste sent to landfills.
    
      2. Circular Economy:
       Sri Lanka can benefit from adopting a circular economy model, where waste is minimized, and materials are reused, repurposed, or recycled into new products. This approach can create jobs and contribute to the economy.
    
      3. Government Policies:
       The government has begun to introduce policies that promote waste management, such as bans on certain plastic items and encouraging businesses to adopt eco-friendly practices. These policies, if expanded and properly enforced, can help steer the country toward more sustainable waste management practices.
    
      4. Public-Private Partnerships:
       Collaborations between the government, local authorities, and private sector companies can result in more efficient waste management solutions. Public-private partnerships could lead to better infrastructure, advanced technologies, and more sustainable practices.
    
      Conclusion:
    
      Addressing waste management in Sri Lanka requires a multi-faceted approach, focusing on improving infrastructure, public awareness, and policy enforcement. With the right strategies and initiatives, Sri Lanka has the opportunity to create a more sustainable future while also tackling the challenges of waste management. Through recycling, the adoption of circular economy principles, and increased investment in waste management technologies, the country can reduce its environmental impact and create a cleaner, greener environment for future generations.`,
    date: "19 Mar 2025",
    category: "Opinion Articles",
    author: "Sri Lankan Environmental Expert",
    link: "/articles/waste-management-in-sri-lanka"
  }
];

const ArticlesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dbArticles, setDbArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/articles');
      const data = await response.json();
      // Filter only approved articles
      const approvedArticles = data.filter(article => article.status === 'approved');
      setDbArticles(approvedArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  // Combine hardcoded and database articles
  const allArticles = [...hardcodedArticles, ...dbArticles];

  const filteredArticles = allArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gray-100 w-full mt-16 py-12">
      <div className="max-w-screen-xl w-full px-4 md:px-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search an article"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-md shadow-sm w-72 focus:ring-green-500 focus:border-green-500"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
          <button
            onClick={() => navigate("/articles/add")}
            className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Add article
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
              <div key={article._id || index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col hover:shadow-xl transition-shadow">
                <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-md mb-4" />
                <h3 className="text-green-700 font-semibold">{article.title}</h3>
                <p className="text-gray-500 text-sm">{article.date} • {article.category}</p>
                <p className="text-gray-600 mt-2">{article.excerpt}</p>
                <button
                  onClick={() => {
                    if (article._id) {
                      // For database articles, navigate with ID
                      navigate(`/articles/${article._id}`);
                    } else {
                      // For hardcoded articles, navigate with index and state
                      navigate(`/articles/${index}`, { state: { article } });
                    }
                  }}
                  className="mt-4 text-green-700 font-bold flex items-center"
                >
                  Read more <FaArrowRight className="ml-2" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">No articles found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
