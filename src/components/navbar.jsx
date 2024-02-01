import { useState, useEffect } from 'react';
import navItems from '../../public/data/nav-items.json'
import Link from "next/link"

export default function Navbar() {
    console.log(navItems)

    const [fetchItems, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/data/nav-items.json');
                const data = await res.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
}, []);

    return (
        <nav>
            <div className='p-10 flex justify-around'>
                {/* <a href={navItems[0].href} id={navItems[0].id}>{navItems[0].text}</a>
                <a href={navItems[1].href} id={navItems[1].id}>{navItems[1].text}</a>
                <a href={navItems[2].href} id={navItems[2].id}>{navItems[2].text}</a>
                <a href={navItems[3].href} id={navItems[3].id}>{navItems[3].text}</a>
                <a href={navItems[4].href} id={navItems[4].id}>{navItems[4].text}</a> */}
                {fetchItems.map((route, index) => (
                    <Link href={route.href} key={index}>
                        <p>{route.text}</p>
                    </Link>
                ))}
            </div>
        </nav>
    );
}