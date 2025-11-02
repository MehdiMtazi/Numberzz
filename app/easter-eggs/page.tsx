'use client';

import { useState } from 'react';

export default function EasterEggsPage() {
	const [expandedEgg, setExpandedEgg] = useState<string | null>(null);

	const easterEggs = [
		{
			id: "darius",
			symbol: "Ð",
			name: "Darius Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Search for 'darius' in the search bar and press Enter",
			reference: "League of Legends",
			description: "The man with the gigantotitan arm! Darius, the powerful Noxian general, conqueror and warlord.",
			culturalNote: "Reference to the champion Darius, known for his devastating ultimate 'Noxian Guillotine' which resets its cooldown with each elimination.",
			tips: "League of Legends fans will love this treasure!",
			difficulty: "🟢 Easy"
		},
		{
			id: "nyan",
			symbol: "🌈",
			name: "Nyan Cat Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Search for 'nyan' in the search bar and press Enter",
			reference: "Internet Culture",
			description: "The legendary rainbow cat! Nyan Cat is one of the most iconic creatures on the Internet.",
			culturalNote: "Created in 2011, Nyan Cat went viral with its YouTube video showing a half-pop-tart cat traveling through space with a rainbow.",
			tips: "The oldest cat meme on the web! A must-have for 2010s Internet nostalgia lovers.",
			difficulty: "🟢 Easy"
		},
		{
			id: "chroma",
			symbol: "◆",
			name: "Chroma Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Click 7 times in a row on the 'Numberz' logo in the top left",
			reference: "Konami Code",
			description: "A multicolored precious stone! The Chroma Coin appears after a series of clicks on the logo.",
			culturalNote: "Inspired by the Konami Code concept (↑ ↑ ↓ ↓ ← → ← → B A), a hidden button sequence in Konami games.",
			tips: "Click click click... Easter eggs that require interaction are often the most satisfying!",
			difficulty: "🟡 Medium"
		},
			{
			id: "wukong",
			symbol: "☯",
			name: "Monkey King Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.05 SEPOLIA",
			trigger: "Search for 'wukong' in the search bar and press Enter",
			reference: "League of Legends",
			description: "The king of monkeys! Wukong master of martial arts, ready to crush his enemies with his magic staff.",
			culturalNote: "The character Wukong is inspired by the Monkey King of Chinese mythology (Sun Wukong) from 'Journey to the West'.",
			tips: "After unlocking, this rare coin becomes available for purchase. Secure it before someone else does!",
			difficulty: "🟢 Easy"
		},
			{
			id: "halflife",
			symbol: "½",
			name: "Half-Life Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.048 SEPOLIA",
			trigger: "Search for 'half-life' in the search bar and press Enter",
			reference: "Gaming",
			description: "Half-Life 3 confirmed? No, but this coin represents the infinite wait of the gaming community.",
			culturalNote: "Half-Life is a cult classic FPS game series created by Valve. The mystery around Half-Life 3 has become a meme.",
			tips: "The fraction '½' perfectly represents the incompleteness of the series. A meme for true gamers!",
			difficulty: "🟢 Easy"
		},
		{
			id: "meme",
			symbol: "🎲",
			name: "Meme Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.042 SEPOLIA",
			trigger: "Search for 'meme' in the search bar and press Enter",
			reference: "Internet Culture",
			description: "Amazing! It's the coin for all Internet culture enthusiasts.",
			culturalNote: "Memes are at the heart of modern Internet culture. This coin celebrates all the memes that have shaped the web.",
			tips: "What do you call a meme coin? A 'MemeToken'! 😄",
			difficulty: "🟡 Medium"
		},
		{
			id: "secret",
			symbol: "🔐",
			name: "Secret Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.035 SEPOLIA",
			trigger: "Press the 'Search' button 10 times in a row (or perform 10 searches in a row)",
			reference: "Mystery",
			description: "Mysterious! This coin represents the ultimate secret hidden in the application.",
			culturalNote: "Secret coins are a tradition in gaming and web applications. This one rewards perseverance!",
			tips: "This secret requires more effort than the others. Who will find the hidden pattern?",
			difficulty: "🔴 Hard"
		}
	];

	return (
		<div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #070812 0%, #1a1a2e 100%)', color: 'white', fontFamily: 'Inter, sans-serif'}}>
			{/* Header */}
		<div style={{padding: '4rem 2rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
			<h1 style={{fontSize: '3rem', fontWeight: 900, marginBottom: '1rem'}}>
				🔮 Complete Guide to Easter Eggs
			</h1>
			<p style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto'}}>
				Discover all the hidden treasures of Numberz. Find easter eggs, unlock secret coins, and complete your collection!
			</p>
		</div>			<div style={{maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem'}}>
				{/* Legend */}
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem'}}>
				<div style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.5rem', borderRadius: '0.75rem'}}>
					<div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🟢 FREE</div>
					<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>
						Added directly to your collection at no cost
					</p>
				</div>
				<div style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.5rem', borderRadius: '0.75rem'}}>
					<div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🟠 PREMIUM</div>
					<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>
						Available for purchase after unlocking
					</p>
				</div>
			</div>				{/* Easter Eggs List */}
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'}}>
					{easterEggs.map((egg) => (
						<div
							key={egg.id}
							onClick={() => setExpandedEgg(expandedEgg === egg.id ? null : egg.id)}
							style={{
								background: 'rgba(255,255,255,0.05)',
								border: '1px solid rgba(255,255,255,0.1)',
								borderRadius: '0.75rem',
								padding: '1.5rem',
								cursor: 'pointer',
								transition: 'all 300ms ease',
								transform: expandedEgg === egg.id ? 'scale(1.02)' : 'scale(1)',
								boxShadow: expandedEgg === egg.id ? '0 10px 40px rgba(255,255,255,0.1)' : 'none'
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
								(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
								(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
							}}
						>
							{/* Header */}
							<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
								<div style={{fontSize: '3rem'}}>{egg.symbol}</div>
								<div style={{flex: 1}}>
									<h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem'}}>
										{egg.name}
									</h3>
									<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
										<span style={{
											background: egg.typeColor,
											color: 'white',
											padding: '0.25rem 0.75rem',
											borderRadius: '0.25rem',
											fontSize: '0.75rem',
											fontWeight: 600
										}}>
											{egg.type}
										</span>
										{egg.price && <span style={{fontSize: '0.9rem', color: '#fbbf24'}}>{egg.price}</span>}
									</div>
								</div>
							</div>

							{/* Trigger */}
							<div style={{background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem'}}>
								<span style={{fontWeight: 600, color: '#818cf8'}}>🎯 Trigger:</span> {egg.trigger}
							</div>

							{/* Quick Stats */}
							<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem'}}>
								<div style={{fontSize: '0.85rem'}}>
									<span style={{color: 'rgba(255,255,255,0.5)'}}>Reference:</span>
									<div style={{fontWeight: 600, color: '#f472b6'}}>{egg.reference}</div>
								</div>
								<div style={{fontSize: '0.85rem'}}>
									<span style={{color: 'rgba(255,255,255,0.5)'}}>Difficulty:</span>
									<div style={{fontWeight: 600}}>{egg.difficulty}</div>
								</div>
							</div>

							{/* Description */}
							<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem'}}>
								{egg.description}
							</p>

							{/* Expanded Content */}
							{expandedEgg === egg.id && (
								<div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', animation: 'fadeIn 0.3s ease-out'}}>
									<div style={{marginBottom: '1rem'}}>
										<h4 style={{fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fbbf24'}}>
											📚 Cultural Note
										</h4>
										<p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6}}>
											{egg.culturalNote}
										</p>
									</div>
									<div>
										<h4 style={{fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f472b6'}}>
											💡 Treasure Hunt Tips
										</h4>
										<p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6}}>
											{egg.tips}
										</p>
									</div>
								</div>
							)}

							{/* Click hint */}
							<div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', textAlign: 'center'}}>
								{expandedEgg === egg.id ? '▲ Click to close' : '▼ Click for more details'}
							</div>
						</div>
					))}
				</div>

			{/* Strategy Section */}
			<div style={{marginTop: '4rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '0.75rem'}}>
				<h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem'}}>🗺️ Treasure Hunt Strategy</h2>
				
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
					<div>
						<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f472b6'}}>
							📍 Phase 1: Free Collection
						</h3>
						<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
							<li>✓ Unlock Darius, Nyan Cat, and Chroma</li>
							<li>✓ Add them to your collection for free</li>
							<li>✓ Complete the "Free Exotic" trio</li>
						</ul>
					</div>
					<div>
						<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fbbf24'}}>
							💎 Phase 2: Premium Collection
						</h3>
						<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
							<li>✓ Unlock Wukong, Half-Life, Meme</li>
							<li>✓ Buy them before others collect them</li>
							<li>✓ Earn the "Exotic Collector" achievement</li>
						</ul>
					</div>
					<div>
						<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#10b981'}}>
							🏆 Phase 3: The Secret
						</h3>
						<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
							<li>✓ Hunt for the Secret Coin (the hardest!)</li>
							<li>✓ Requires 10 rapid interactions</li>
							<li>✓ Ultimate reward for explorers</li>
						</ul>
					</div>
				</div>
			{/* Tips Section */}
			<div style={{marginTop: '3rem', padding: '2rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '0.75rem'}}>
				<h2 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>🔍 General Tips</h2>
				<ul style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 2, paddingLeft: '1.5rem'}}>
					<li>• Easter eggs are best discovered by exploring the app naturally</li>
					<li>• Some triggers require interaction (clicks, multiple entries)</li>
					<li>• Free coins beautifully complement Legendary collections</li>
					<li>• Premium coins are limited - buy them quickly to avoid missing out!</li>
					<li>• Each discovery brings you closer to special achievements</li>
					<li>• Cultural references enrich the treasure hunt experience</li>
					<li>• Share your discoveries with the community!</li>
				</ul>
			</div>
			</div>

			{/* Fun Fact */}
			<div style={{marginTop: '3rem', padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '0.75rem'}}>
				<div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>🌟</div>
				<h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem'}}>
					Fun Fact
				</h3>
				<p style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.8}}>
					Each easter egg is a celebration of Internet culture and gaming. Together, they tell the story of the memes and references that have shaped the web. Happy treasure hunting! 🏆
				</p>
			</div>
			</div>

			{/* Back Button */}
			<div style={{padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
				<a href="/" style={{
					display: 'inline-block',
					padding: '0.75rem 1.5rem',
					background: 'rgba(99, 102, 241, 0.2)',
					border: '1px solid rgba(99, 102, 241, 0.4)',
					borderRadius: '0.5rem',
					color: '#818cf8',
					textDecoration: 'none',
					fontWeight: 600,
					cursor: 'pointer',
					transition: 'all 200ms ease'
				}}
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.3)';
					(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.6)';
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.2)';
					(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.4)';
				}}
				>
					← Back to Collection
				</a>
			</div>
		</div>
	);
}
