export default function HtmlBlock({ config }) { 
    return <div className="container mx-auto p-4" dangerouslySetInnerHTML={{ __html: config?.html || "" }} />; 
}