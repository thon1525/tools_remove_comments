from __future__ import annotations 


def remove_comments (
source :str ,
*,
line_comments :tuple [str ,...]=("//",),
block_comments :tuple [tuple [str ,str ],...]=(
("/*","*/"),
),
preserve_blank_lines :bool =True ,
)->str :


    result :list [str ]=[]

    i =0 
    length =len (source )

    in_string :str |None =None 
    escaped =False 

    in_line_comment =False 
    in_block_comment =False 

    
    removed_comment_on_line =False 

    
    comment_only_line =False 

    while i <length :

        char =source [i ]

        
        
        

        if in_line_comment :

            if char =="\n":
                in_line_comment =False 

                
                while result and result [-1 ]in (" ","\t"):
                    result .pop ()

                    
                    
                if not comment_only_line :
                    result .append ("\n")

                removed_comment_on_line =False 
                comment_only_line =False 

            i +=1 
            continue 

            
            
            

        if in_block_comment :

        
            closed =False 

            for _ ,end in block_comments :

                if source .startswith (end ,i ):

                    in_block_comment =False 

                    i +=len (end )

                    closed =True 

                    break 

            if closed :
                continue 

                
                
                
                
                
                
                
                
                
            i +=1 
            continue 

            
            
            

        if in_string is not None :

            result .append (char )

            if escaped :
                escaped =False 

            elif char =="\\":
                escaped =True 

            elif char ==in_string :
                in_string =None 

            i +=1 
            continue 

            
            
            

        if char in ("'",'"'):

            in_string =char 

            result .append (char )

            i +=1 
            continue 

            
            
            

        found_line_comment =False 

        for marker in line_comments :

            if source .startswith (marker ,i ):

                in_line_comment =True 

                removed_comment_on_line =True 

                
                
                current_line ="".join (result ).split ("\n")[-1 ]

                comment_only_line =not current_line .strip ()

                i +=len (marker )

                found_line_comment =True 

                break 

        if found_line_comment :
            continue 

            
            
            

        found_block_comment =False 

        for start ,_ in block_comments :

            if source .startswith (start ,i ):

                in_block_comment =True 

                removed_comment_on_line =True 

                
                current_line ="".join (result ).split ("\n")[-1 ]

                comment_only_line =not current_line .strip ()

                i +=len (start )

                found_block_comment =True 

                break 

        if found_block_comment :
            continue 

            
            
            

        if char =="\n":

            current_line ="".join (result ).split ("\n")[-1 ]

            
            
            if removed_comment_on_line and not current_line .strip ():
                pass 

            else :
                result .append ("\n")

            removed_comment_on_line =False 
            comment_only_line =False 

            i +=1 
            continue 

            
            
            

        result .append (char )

        i +=1 

    cleaned ="".join (result )

    return _final_cleanup (cleaned )


def _final_cleanup (source :str )->str :
    """
    Final whitespace cleanup.

    - Removes trailing spaces.
    - Removes excessive blank lines.
    - Preserves indentation.
    - Preserves normal formatting.
    """

    lines =source .splitlines ()

    output :list [str ]=[]

    previous_blank =False 

    for line in lines :

    
        line =line .rstrip (" \t")

        if not line .strip ():

        
            if previous_blank :
                continue 

            output .append ("")

            previous_blank =True 

            continue 

        output .append (line )

        previous_blank =False 

        
    while output and not output [0 ].strip ():
        output .pop (0 )

        
    while output and not output [-1 ].strip ():
        output .pop ()

    if not output :
        return ""

    return "\n".join (output )+"\n"