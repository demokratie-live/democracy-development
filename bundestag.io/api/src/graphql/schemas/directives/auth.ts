export default `
directive @auth( 
    requires: Role = USER 
) on FIELD_DEFINITION 

enum Role { 
    BACKEND 
    USER 
}
`;
