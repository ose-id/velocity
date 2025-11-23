!macro customUnInstall
  MessageBox MB_YESNO "Do you want to delete your configuration data and local settings?" IDNO +2
  RMDir /r "$APPDATA\Clone Tools"
!macroend
