
export default function Item(props: any){
    return (
        <div style={{
            height: '100%',
            borderTop: '1px solid #ccc'
        }}>
            {props.data}
        </div>
    )
}